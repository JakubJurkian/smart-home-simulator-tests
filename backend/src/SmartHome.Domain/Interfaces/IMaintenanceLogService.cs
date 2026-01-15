using SmartHome.Domain.Entities;

namespace SmartHome.Domain.Interfaces;

public interface IMaintenanceLogService
{
    void AddLog(Guid deviceId, string title, string description);
    IEnumerable<MaintenanceLog> GetLogsForDevice(Guid deviceId);
    void UpdateLog(Guid id, string title, string description);
    void DeleteLog(Guid id);
}