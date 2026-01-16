using SmartHome.Domain.Entities;
using SmartHome.Domain.Interfaces;

namespace SmartHome.Infrastructure.Services;

public class RoomService(IRoomRepository roomRepository, IDeviceRepository deviceRepository) : IRoomService
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
        deviceRepository.DeleteAllByRoomId(id);
        roomRepository.Delete(id);
    }
    public void RenameRoom(Guid id, string newName)
    {
        var room = roomRepository.GetById(id) ?? throw new Exception("Room not found.");
        room.Rename(newName);
        roomRepository.Update(room);
    }
}