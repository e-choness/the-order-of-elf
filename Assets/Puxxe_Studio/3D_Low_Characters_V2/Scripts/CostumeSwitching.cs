
/*XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX
 ----------.----------.----------.----------
(c)	Puxxe Studio | 2022
	16/11/2022 (13:51:19)
 ----------.----------.----------.----------
XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX*/


namespace PuxxeStudio{		

	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;

	public class CostumeSwitching : MonoBehaviour{
		public GameObject[] costumesList;
		public int costumeSelected=0;
		bool costumesHidded;
		void Start(){
			CostumeHideAll();
		}
		void Update(){
			if (Input.GetKeyDown(KeyCode.Keypad5)){
				CostumeSwitchNext();
			}
		}
		public void CostumeSwitchNext(){
			if (costumeSelected< costumesList.Length-1){
				costumeSelected++;
			}else{
				costumeSelected = -1;
			}
			CostumeShow(costumeSelected);
		}	
		public void CostumeSwitchHideAndShow(){
			 if(costumesHidded==true){
				 CostumeShowAll();
			 }else{
				 CostumeHideAll();
			 }
		}
		public void CostumeShow(int costumeID=-1){
			  CostumeHideAll();
			  costumeSelected = costumeID;
			if (costumeSelected>=0){ 
				if (costumesList.Length>0){
					if (costumesList[costumeSelected].gameObject != null){
						costumesList[costumeSelected].gameObject.SetActive(true);
					}
				}else{
				}        
			}       
		}
		public void CostumeShowAll(){
			for (int i=0;i<costumesList.Length;i++){
				costumesList[i].gameObject.SetActive(true);
			}
			costumesHidded = false;		
		}    
		public void CostumeHideAll(){
			for (int i=0;i<costumesList.Length;i++){
				costumesList[i].gameObject.SetActive(false);
			}
			costumesHidded = true;		
		}
		public void CostumeHideAllAndShowAtual(){
			costumesList[costumeSelected].gameObject.SetActive(!costumesList[costumeSelected].gameObject.activeSelf);
		}
	}	
}
