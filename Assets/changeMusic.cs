using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class changeMusic : MonoBehaviour
{
    public AudioSource source;
    public AudioClip clip;
    // Start is called before the first frame update
    void OnEnable()
    {
        source.Stop();
        source.PlayOneShot(clip);
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
