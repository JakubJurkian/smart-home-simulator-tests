namespace SmartHome.Domain.Entities;

public class LightBulb(string name, Guid roomId) : Device(name, roomId, "LightBulb")
{
    public bool IsOn { get; private set; }
    public void TurnOn()
    {
        IsOn = true;
    }
    public void TurnOff()
    {
        IsOn = false;
    }
}