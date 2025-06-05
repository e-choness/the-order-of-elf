using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ResolutionController : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Screen.SetResolution(1280,720, FullScreenMode.Windowed);
    }

    // Update is called once per frame
    public void Resolution1280x720()
    {
        Screen.SetResolution(1280,720, FullScreenMode.Windowed);
    }
    public void Resolution1920x1080()
    {
        Screen.SetResolution(1920,1080, FullScreenMode.Windowed);
    }
    public void Resolution1024x768()
    {
        Screen.SetResolution(1024,768, FullScreenMode.Windowed);
    }
}
