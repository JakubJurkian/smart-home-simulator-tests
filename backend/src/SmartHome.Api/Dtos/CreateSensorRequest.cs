namespace SmartHome.Api.Dtos;
public record CreateSensorRequest(string Name, Guid RoomId);