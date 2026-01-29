namespace SmartHome.Api.Dtos;

public class UpdateDeviceRequest
{
    public string Name { get; set; } = string.Empty;

    public Guid DeviceId { get; set; }
}