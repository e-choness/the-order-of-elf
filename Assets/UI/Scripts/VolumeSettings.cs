using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Audio;
using System;
using UnityEngine.Sequences;


public class VolumeSettings : MonoBehaviour
{
    // Start is called before the first frame update

    [SerializeField] Slider musicSlider;
    //[SerializeField] Slider SFXSlider;
    [SerializeField] AudioMixer mixer;

    float audioValue;

    public const string MIXER_MUSIC = "BackGroundMaster";
    //public const string MIXER_SFX = "SFXVolume";
    
   
   void Awake()
    {
      musicSlider.onValueChanged.AddListener(SetMusicVolume);
    }
  
  void Start()
  {
    musicSlider.value = PlayerPrefs.GetFloat(AudioManager.MUSIC_KEY, 1f);
    //SFXSlider.value = PlayerPrefs.GetFloat(AudioManager.SFX_KEY, 1f);
  }

void OnDisable() 
{
  PlayerPrefs.SetFloat(AudioManager.MUSIC_KEY, musicSlider.value);
  //PlayerPrefs.SetFloat(AudioManager.SFX_KEY, SFXSlider.value);
}
 
 void SetMusicVolume(float value)
 {
  mixer.SetFloat(MIXER_MUSIC, Mathf.Log10(value) * 20);
  
 }
 //void SetSFXVolume(float value)
 //{
 // mixer.SetFloat(MIXER_SFX, Mathf.Log10(value) * 20);
  
 //}

  
}
