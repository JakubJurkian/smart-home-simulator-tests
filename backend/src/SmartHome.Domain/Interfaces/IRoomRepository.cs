using SmartHome.Domain.Entities;

namespace SmartHome.Domain.Interfaces;

public interface IRoomRepository
{
    void Add(Room room);
    IEnumerable<Room> GetAllByUserId(Guid userId);
    Room? GetById(Guid id);
    void Delete(Guid id);
    void Update(Guid id, string newName);
}