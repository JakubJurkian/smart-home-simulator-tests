using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using SmartHome.Api.Dtos; // Upewnij się, że masz tu swoje DTO
using Xunit;

namespace SmartHome.IntegrationTests.Controllers;

public class MaintenanceLogsControllerTests(IntegrationTestFactory factory) : IClassFixture<IntegrationTestFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task CreateLog_ShouldAddLogToDevice_WhenUserIsLoggedIn()
    {
        // Arrange - setup (user => room => device)
        var uniqueSuffix = Guid.NewGuid().ToString().Substring(0, 8);
        var email = $"servicer-{uniqueSuffix}@test.com";

        // Auth
        await _client.PostAsJsonAsync("/api/users/register", new RegisterRequest("ServiceTech", email, "Pass123!"));
        var loginResponse = await _client.PostAsJsonAsync("/api/users/login", new LoginRequest(email, "Pass123!"));
        loginResponse.EnsureSuccessStatusCode();

        // Create Room
        await _client.PostAsJsonAsync("/api/rooms", new CreateRoomRequest("Bedroom"));

        // Get RoomId
        var roomsRes = await _client.GetAsync("/api/rooms");
        var rooms = await roomsRes.Content.ReadFromJsonAsync<List<TestRoomDto>>();
        var roomId = rooms!.First(r => r.Name == "Bedroom").Id;

        // Create Device
        var newDevice = new CreateDeviceRequest("Sensor 1", Guid.Parse(roomId), "TemperatureSensor");
        await _client.PostAsJsonAsync("/api/devices", newDevice);

        // Get DeviceId
        var devicesRes = await _client.GetAsync("/api/devices");
        var devices = await devicesRes.Content.ReadFromJsonAsync<List<TestDeviceDto>>();
        var deviceId = devices!.First(d => d.Name == "Sensor 1").Id;

        // Act - create maintenance log
        var newLog = new CreateLogRequest(Guid.Parse(deviceId), "Info", "Routine Checkup");

        var logResponse = await _client.PostAsJsonAsync("/api/logs", newLog);

        // Assert
        logResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.OK);

        // Verify log exists
        var getLogsResponse = await _client.GetAsync($"/api/logs/{deviceId}");
        getLogsResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await getLogsResponse.Content.ReadAsStringAsync();
        content.Should().Contain("Routine Checkup");
    }
}