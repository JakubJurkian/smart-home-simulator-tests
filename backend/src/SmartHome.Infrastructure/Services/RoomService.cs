using SmartHome.Domain.Entities;
using SmartHome.Domain.Interfaces;

namespace SmartHome.Infrastructure.Services;

public class RoomService(IRoomRepository roomRepository) : IRoomService
{
    public void AddRoom(Guid userId, string name)
    {
        var room = new Room { Id = Guid.NewGuid(), UserId = userId, Name = name };
        roomRepository.Add(room);
    }

    public IEnumerable<Room> GetUserRooms(Guid userId)
    {
        return roomRepository.GetAllByUserId(userId);
    }

    public void DeleteRoom(Guid id)
    {
        roomRepository.Delete(id);
    }
    public void UpdateRoom(Guid id, string newName)
    {
        roomRepository.Update(id, newName);
    }
}