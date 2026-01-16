using SmartHome.Domain.Entities;
using SmartHome.Domain.Interfaces;
using SmartHome.Infrastructure.Persistence;

namespace SmartHome.Infrastructure.Repositories;

public class RoomRepository(SmartHomeDbContext context) : IRoomRepository
{
    public void Add(Room room)
    {
        context.Rooms.Add(room);
        context.SaveChanges();
    }

    public IEnumerable<Room> GetAllByUserId(Guid userId)
    {
        return context.Rooms.Where(r => r.UserId == userId).ToList();
    }

    public Room? GetById(Guid id)
    {
        return context.Rooms.Find(id);
    }

    public void Delete(Guid id)
    {
        var room = context.Rooms.Find(id);
        if (room != null)
        {
            context.Rooms.Remove(room);
            context.SaveChanges();
        }
    }

    public void Update(Room room)
    {
        context.Rooms.Update(room);
        context.SaveChanges();
    }
}