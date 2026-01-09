namespace SmartHome.Domain.Entities;

public class LightBulb(string name, string room) : Device(name, room, "LightBulb")
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