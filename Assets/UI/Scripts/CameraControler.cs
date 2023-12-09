using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using DG.Tweening;

public class CameraControler : MonoBehaviour
{

    [SerializeField]
    private float duration;

    // Start is called before the first frame update
   
   void Update()
   {
    
   }
   public void LookAt(Transform target)
   {
    transform.DOLookAt(target.position, duration);
    Debug.Log("Looking");
   }

    public void Quit()
    {
        Application.Quit();
    }

}
