using Microsoft.AspNetCore.Mvc;
using SmartHome.Domain.Interfaces;

namespace SmartHome.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController(IRoomService roomService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetMyRooms()
    {
        var userId = GetCurrentUserId();
        return Ok(roomService.GetUserRooms(userId));
    }

    [HttpPost]
    public IActionResult AddRoom([FromBody] string name)
    {
        var userId = GetCurrentUserId();
        roomService.AddRoom(userId, name);
        return Ok();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteRoom(Guid id)
    {
        roomService.DeleteRoom(id);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        if (Request.Cookies.TryGetValue("userId", out var userIdString) &&
            Guid.TryParse(userIdString, out var userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("User not logged in");
    }
}