using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum GiftProperty
{
    Nice = 0,
    Naughty = 1
}

public class Gift
{
    public string Name { get; set; }
    public GiftProperty Property { get; set; }
}
