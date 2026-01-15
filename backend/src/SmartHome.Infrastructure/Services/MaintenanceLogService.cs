using SmartHome.Domain.Entities;
using SmartHome.Domain.Interfaces;

namespace SmartHome.Infrastructure.Services;

public class MaintenanceLogService(IMaintenanceLogRepository logRepository) : IMaintenanceLogService
{
    public void AddLog(Guid deviceId, string title, string description)
    {
        var log = new MaintenanceLog
        {
            Id = Guid.NewGuid(),
            DeviceId = deviceId,
            Title = title,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };

        logRepository.Add(log);
    }

    public IEnumerable<MaintenanceLog> GetLogsForDevice(Guid deviceId)
    {
        return logRepository.GetByDeviceId(deviceId);
    }

    public void UpdateLog(Guid id, string title, string description)
    {
        var log = logRepository.GetById(id);
        if (log == null)
        {
            throw new Exception("Log not found.");
        }

        log.Title = title;
        log.Description = description;

        logRepository.Update(log);
    }

    public void DeleteLog(Guid id)
    {
        var log = logRepository.GetById(id);
        if (log == null)
        {
            throw new Exception("Log not found.");
        }
        logRepository.Delete(log);
    }
}