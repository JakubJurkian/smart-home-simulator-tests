namespace SmartHome.Api.Dtos;

// DTO for creating a new log
public record CreateLogRequest(Guid DeviceId, string Title, string Description);

// DTO for updating an existing log
public record UpdateLogRequest(string Title, string Description);