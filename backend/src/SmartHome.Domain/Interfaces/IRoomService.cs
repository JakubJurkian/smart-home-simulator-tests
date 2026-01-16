using SmartHome.Domain.Entities;

namespace SmartHome.Domain.Interfaces;

public interface IRoomService
{
    void AddRoom(Guid userId, string name);
    IEnumerable<Room> GetUserRooms(Guid userId);
    void DeleteRoom(Guid id);
    void UpdateRoom(Guid id, string newName);
}