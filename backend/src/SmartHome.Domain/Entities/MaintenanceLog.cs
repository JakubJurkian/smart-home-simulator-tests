namespace SmartHome.Domain.Entities;

public class MaintenanceLog
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; } // Foreign Key
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}