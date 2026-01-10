using System.Net;
using System.Net.Sockets;
using System.Text;
using SmartHome.Domain.Interfaces;

namespace SmartHome.Api.BackgroundServices;

public class TcpSmartHomeServer : BackgroundService
{
    private readonly ILogger<TcpSmartHomeServer> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private const int Port = 9000;

    public TcpSmartHomeServer(ILogger<TcpSmartHomeServer> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var listener = new TcpListener(IPAddress.Any, Port);
        listener.Start();

        _logger.LogInformation($" TCP Server started on port {Port}. Waiting for connections...");

        while (!stoppingToken.IsCancellationRequested)
        {
            // wait for client (e.g. putty terminal)
            var client = await listener.AcceptTcpClientAsync(stoppingToken);

            // handle client in bg
            _ = HandleClientAsync(client, stoppingToken);
        }
    }
    private async Task HandleClientAsync(TcpClient client, CancellationToken stoppingToken)
    {
        _logger.LogInformation("Client connected!");

        try
        {
            using var stream = client.GetStream();
            using var reader = new StreamReader(stream, Encoding.UTF8);
            using var writer = new StreamWriter(stream, Encoding.UTF8) { AutoFlush = true };


            await writer.WriteLineAsync("Welcome to SmartHome Raw TCP Interface!");
            await writer.WriteLineAsync("Commands: LIST, TOGGLE <GUID>, EXIT");

            while (client.Connected && !stoppingToken.IsCancellationRequested)
            {
                await writer.WriteAsync("> ");
                var command = await reader.ReadLineAsync(stoppingToken);

                if (string.IsNullOrWhiteSpace(command)) break;

                var response = await ProcessCommand(command);
                await writer.WriteLineAsync(response);

                if (command.Trim().ToUpper() == "EXIT") break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling TCP client");
        }
        finally
        {
            client.Close();
            _logger.LogInformation("🔌 Client disconnected.");
        }
    }

    private async Task<string> ProcessCommand(string commandInput)
    {
        var parts = commandInput.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var command = parts[0].ToUpper();

        // Scope Creation
        // BackgroundService is a Singleton, but dependencies like DeviceService and DbContext are Scoped.
        // Direct injection into the constructor is not possible here.
        // We need to create a manual scope to resolve the service instance.
        using var scope = _scopeFactory.CreateScope();
        var deviceService = scope.ServiceProvider.GetRequiredService<IDeviceService>();

        switch (command)
        {
            case "LIST":
                var devices = deviceService.GetAllDevices();
                var sb = new StringBuilder();
                foreach (var d in devices)
                {
                    string status = "UNKNOWN";
                    if (d is Domain.Entities.LightBulb b) status = b.IsOn ? "[ON]" : "[OFF]";
                    if (d is Domain.Entities.TemperatureSensor) status = "[SENSOR]";

                    sb.AppendLine($"{d.Id} | {d.Name} {status}");
                }
                return sb.ToString();

            case "TOGGLE":
                if (parts.Length < 2) return "Error: Provide ID";
                if (!Guid.TryParse(parts[1], out var id)) return "Error: Invalid GUID";

                if (deviceService.TurnOn(id)) return "Device turned ON!";
                if (deviceService.TurnOff(id)) return "Device turned OFF!";

                return "Error: Device not found or is not a switchable device.";

            case "EXIT":
                return "Goodbye.";

            default:
                return "Unknown command.";
        }
    }
}

