
/*XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX
 ----------.----------.----------.----------
(c)	Puxxe Studio | 2022
	16/11/2022 (14:01:15)
 ----------.----------.----------.----------
XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX*/

namespace PuxxeStudio{	

	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;

	public class HandObjectSwitching : MonoBehaviour{
		public GameObject[] handObjectsList;
		public int handObjectSelected=0;
		bool handObjectsHidded;
		void Start(){
			HandObjectShow(handObjectSelected);
		}
		void Update(){
			if (Input.GetKeyDown(KeyCode.Keypad5)){
				HandObjectSwitchNext();
			}
		}
		public void HandObjectSwitchNext(){
			if (handObjectSelected< handObjectsList.Length-1){
				handObjectSelected++;
			}else{
				handObjectSelected = -1;
			}
			HandObjectShow(handObjectSelected);
		}
		public void HandObjectSwitchHideAndShow(){
			 if(handObjectsHidded==true){
				 HandObjectShowAll();
			 }else{
				 HandObjectHideAll();
			 }
		}	
		public void HandObjectShow(int handObjectID=-1){
			HandObjectHideAll();
			handObjectSelected = handObjectID;
			if (handObjectSelected>=0){ 
				if (handObjectsList.Length>0){
					if (handObjectsList[handObjectSelected].gameObject != null){
						handObjectsList[handObjectSelected].gameObject.SetActive(true);
					}
				}else{
				}        
			}       
		}
		public void HandObjectShowAll(){
			for (int i=0;i<handObjectsList.Length;i++){
				handObjectsList[i].gameObject.SetActive(true);
			}
			handObjectSelected = -1;
			handObjectsHidded = false;		
		}    	
		public void HandObjectHideAll(){
			for (int i=0;i<handObjectsList.Length;i++){
				handObjectsList[i].gameObject.SetActive(false);
			}
			handObjectSelected = -1;
			handObjectsHidded = true;
		}
		public void HandObjectHideAllAndShowAtual(){
			handObjectsList[handObjectSelected].gameObject.SetActive(!handObjectsList[handObjectSelected].gameObject.activeSelf);
		}
	}	
}
