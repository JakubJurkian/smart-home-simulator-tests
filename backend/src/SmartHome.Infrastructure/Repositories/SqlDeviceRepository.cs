using SmartHome.Domain.Entities;
using SmartHome.Domain.Interfaces;
using SmartHome.Infrastructure.Persistence;

namespace SmartHome.Infrastructure.Repositories;

// Inject (DbContext) - connection with db
public class SqlDeviceRepository(SmartHomeDbContext context) : IDeviceRepository
{
    public void Add(Device device)
    {
        // Add to que
        context.Devices.Add(device);

        // We send SQL to db
        context.SaveChanges();
    }

    public IEnumerable<Device> GetAll()
    {
        // Download all to list
        return [.. context.Devices];
    }

    public Device? GetById(Guid id)
    {
        // Find by ID (null if not found)
        return context.Devices.Find(id);
    }

    public void Update(Device device)
    {
        context.Devices.Update(device);
        context.SaveChanges();
    }
}