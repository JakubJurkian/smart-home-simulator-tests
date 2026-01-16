namespace SmartHome.Api.Dtos;
public record CreateLightBulbRequest(string Name, Guid RoomId);