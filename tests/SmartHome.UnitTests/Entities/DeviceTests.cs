using FluentAssertions;
using SmartHome.Domain.Entities;

namespace SmartHome.UnitTests.Entities;

public class DeviceTests
{
    // Test concrete implementation for abstract Device class
    private class TestDevice : Device
    {
        public TestDevice(string name, Guid roomId) : base(name, roomId, "TestDevice") { }
    }

    [Fact]
    public void Constructor_ShouldInitializeProperties_WhenValidParametersProvided()
    {
        // Arrange
        var name = "Test Device";
        var roomId = Guid.NewGuid();

        // Act
        var device = new TestDevice(name, roomId);

        // Assert
        device.Id.Should().NotBeEmpty();
        device.Name.Should().Be(name);
        device.RoomId.Should().Be(roomId);
        device.Type.Should().Be("TestDevice");
    }

    [Fact]
    public void Rename_ShouldUpdateName_WhenValidNameProvided()
    {
        // Arrange
        var device = new TestDevice("OldName", Guid.NewGuid());
        var newName = "NewName";

        // Act
        device.Rename(newName);

        // Assert
        device.Name.Should().Be(newName);
    }

    [Fact]
    public void Rename_ShouldThrowArgumentException_WhenNameIsEmpty()
    {
        // Arrange
        var device = new TestDevice("ValidName", Guid.NewGuid());

        // Act
        Action action = () => device.Rename("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Device name cannot be empty.");
    }

    [Fact]
    public void Rename_ShouldThrowArgumentException_WhenNameIsNull()
    {
        // Arrange
        var device = new TestDevice("ValidName", Guid.NewGuid());

        // Act
        Action action = () => device.Rename(null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Device name cannot be empty.");
    }

    [Fact]
    public void Rename_ShouldThrowArgumentException_WhenNameIsWhitespace()
    {
        // Arrange
        var device = new TestDevice("ValidName", Guid.NewGuid());

        // Act
        Action action = () => device.Rename("   ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Device name cannot be empty.");
    }

    [Fact]
    public void Id_ShouldBeUnique_ForEachNewDevice()
    {
        // Arrange & Act
        var device1 = new TestDevice("Device1", Guid.NewGuid());
        var device2 = new TestDevice("Device2", Guid.NewGuid());

        // Assert
        device1.Id.Should().NotBe(device2.Id);
    }
}