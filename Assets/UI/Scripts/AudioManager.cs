using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

public class AudioManager : MonoBehaviour
{
   public static AudioManager instance;
   [SerializeField] AudioMixer mixer;

public const string MUSIC_KEY = "musicVolume";
public const string SFX_KEY = "SFXVolume";
   void Awake()
   {
        //if (instance == null)
        //{
        //    instance = this;

        //    DontDestroyOnLoad(gameObject);
        //}
        //else
        //{
        //    Destroy(gameObject);
        //}

        LoadVolume();
   }

   void LoadVolume() //Volume saved in VolumeSetting.cs
   {
    float musicVolume = PlayerPrefs.GetFloat(MUSIC_KEY, 1f);
    //float SFXVolume = PlayerPrefs.GetFloat(SFX_KEY, 1f);
    
    mixer.SetFloat(VolumeSettings.MIXER_MUSIC, Mathf.Log10(musicVolume) * 20);
    //mixer.SetFloat(VolumeSettings.MIXER_SFX, Mathf.Log10(SFXVolume) * 20);
   }
}
