using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Credits : MonoBehaviour
{
    // Start is called before the first frame update
    private Animator mAnimator;
    public Button credz;
    void Start()
    {
        mAnimator = GetComponent<Animator>();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void StartAnimation()
        {
            mAnimator.SetBool(("Start"), true);
        }
    public void StopAnimation()
        {
            mAnimator.SetBool(("Start"), false);
        }
}

