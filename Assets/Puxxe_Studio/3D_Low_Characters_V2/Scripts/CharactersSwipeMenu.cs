
/*XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX
 ----------.----------.----------.----------
(c)	Puxxe Studio | 2022
	16/11/2022 (13:49:55)
 ----------.----------.----------.----------
XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX*/

namespace PuxxeStudio{		

	using System;
	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;
	using UnityEngine.UI;

	public class CharactersSwipeMenu : MonoBehaviour{
		[SerializeField]
		bool autoRotation = true;
		public bool smoothSpeedAnimation = false;
		[SerializeField]
		Text characterInfoText;
		[Header("Buttons - Drag to Here")]
		[SerializeField]
		Button handObjectSwitchButton;
		[SerializeField]
		Button costumeSwitchButton;
		[SerializeField]
		Button previousButton;
		[SerializeField]
		Button nextButton;
		[Header("Toogles - Drag to Here")]
		[SerializeField]
		Toggle rotateToggle;
		[SerializeField]
		Toggle speedToggle;
		[SerializeField]
		Toggle hideObjectsToggle;
		[SerializeField]
		Toggle hideGroundToggle;
		bool showPersonalObjects = true;
		bool showGround = true;
		[Header("Player - Auto Find")]
		[SerializeField]
		bool hideOthersCharacters = true;   
		public PlayerControllDemo playerControllDemo;
		GameObject character;
		int animatorActionID = 61;
		float animatorSpeed =1.0f;
		Transform characterTransform;
		public HandObjectSwitching handObjectSwitching;
		public CostumeSwitching costumeSwitching;
		[Header("Lists - Drag to Here")]
		int characterID = 0;
		float rotationAtual = -90;
		[SerializeField]
		GameObject[] charactersList = null;
		[SerializeField]
		GameObject[] personalObjects3DList = null;
		GameObject personalObjects3D;
		[SerializeField]
		GameObject[] personalButtonActionsList = null;
		GameObject actionsButtons;
		GameObject menu2D;
		public delegate void FunctionSendComArgs(string arg1);
		public static event FunctionSendComArgs FunctionEventSendInfoWithArgs;
		public static string stringArgs = "Dispatch Event - Args do Sender :) ";
		private void Awake(){
			 if (charactersList != null){
				 if(charactersList.Length>0){
					character = charactersList[characterID];
					playerControllDemo = charactersList[characterID].GetComponent<PlayerControllDemo>();
					handObjectSwitching = charactersList[characterID].GetComponent <HandObjectSwitching>();
					costumeSwitching = charactersList[characterID].GetComponent <CostumeSwitching>();
				 }			
			 }      
	   }
		void Start(){
			menu2D = GameObject.FindGameObjectWithTag("Menu2D");
			characterID = 0;
			StartVisbileCharacter();
			HideCharacters();       
			ShowAtualCharacter();
			SetActionInt(61);
		}
		void Update(){
			GetKeyBoard();
			if (autoRotation){
				RotateCharacter();
			}
		}
		void StartVisbileCharacter(){
			if (charactersList != null){
				if (charactersList.Length > 0){
					for (int i = 0; i < charactersList.Length; i++){
						character = charactersList[i];            
						if (character.gameObject.activeSelf){                       
							characterID = i; 
						}
					}
				}
			}
		}
		void HideCharacters(){
			if (charactersList != null){
				if (charactersList.Length > 0){
					for (int i = 0; i < charactersList.Length; i++){
						character = charactersList[i];
						if (character == null){
							Debug.LogWarning("character NOT FOUND!");
							return;
						}
						character.transform.parent.rotation = new Quaternion(0, rotationAtual, 0, 0);
						if (hideOthersCharacters == true){
							character.SetActive(false);
						}
						if (personalObjects3DList != null){
							if (personalObjects3DList.Length > 0){
								personalObjects3D = personalObjects3DList[i];
								personalObjects3D.SetActive(false);
							}
						}
						if (personalButtonActionsList != null){
							if (personalButtonActionsList.Length > 0){
								actionsButtons = personalButtonActionsList[i];
								actionsButtons.SetActive(false);
							}
						}                   
					}
					ShowCharacterInfo();
				}          
			}       
		}
		void ShowAtualCharacter(){
			 if (charactersList != null){
				 if(charactersList.Length>0){
					character = charactersList[characterID];
					if (character == null){
						Debug.LogWarning("character NOT FOUND!");
						return;
					}
					character.SetActive(true);
					if (characterTransform!=null){
						character.transform.position = characterTransform.position;
						character.transform.rotation = characterTransform.rotation;
					} 
					playerControllDemo = character.GetComponent<PlayerControllDemo>();
					if (playerControllDemo == null){
						Debug.LogWarning("playerControllDemo NOT FOUND!");
						return;
					}
					playerControllDemo.FindComponents();
					playerControllDemo.animator.speed = animatorSpeed;
					SetActionInt(animatorActionID);
					handObjectSwitching = character.GetComponent<HandObjectSwitching>();               
					if (handObjectSwitching == null){
						Debug.LogWarning("handObjectSwitching NOT FOUND!");                   
					}else{
						if (handObjectSwitchButton != null){
							if (handObjectSwitching.handObjectsList.Length <= 0){
								handObjectSwitchButton.interactable = false;
							}else{
								handObjectSwitchButton.interactable = true;
							}
						}
					}
					costumeSwitching = character.GetComponent<CostumeSwitching>();
					if (costumeSwitching == null){
						Debug.LogWarning("costumeSwitching NOT FOUND!");
					}else{
						if (handObjectSwitchButton != null){
							if (costumeSwitching.costumesList.Length <= 0){
								costumeSwitchButton.interactable = false;
							}else{
								costumeSwitchButton.interactable = true;
							}
						}
					}
					if (personalObjects3DList != null){
						if (personalObjects3DList.Length > 0){
							personalObjects3D = personalObjects3DList[characterID];
							personalObjects3D.SetActive(showPersonalObjects);
						}
					}
					if (personalButtonActionsList != null){
						if (personalButtonActionsList.Length > 0){
							actionsButtons = personalButtonActionsList[characterID];
							actionsButtons.SetActive(true);
						}
					}
				 }
			 }			
			ShowCharacterInfo();
			ShowHideButtonsNextPrevious();
		}
		public GameObject GetPersonalActionsButtons(int _characterID=-1){
			if (_characterID<0){
				_characterID = characterID; 
			}
			if (personalButtonActionsList != null){
				if (personalButtonActionsList.Length > 0){
					actionsButtons = personalButtonActionsList[_characterID];
					return actionsButtons;
				}
			}
			return null;
		}
		public Array GetPersonalButtonActionsList(){
			if (personalButtonActionsList != null){
				return personalButtonActionsList;
			}else{
				return null;
			}
		}
		void getPreviousCharacterValues(){
			if (playerControllDemo == null){
				Debug.LogWarning("playerControllDemo NOT FOUND!");
			}else{
				characterTransform = character.transform;
				animatorSpeed = playerControllDemo.animator.speed;
				animatorActionID = playerControllDemo.actionID;
			}       
		}
		void ShowCharacterInfo(){
			if (characterInfoText != null){				
				
				character = charactersList[characterID];
				string char_name = character.gameObject.name;		
				
				if(charactersList[0].gameObject.name.Contains("Char_000")){
					characterInfoText.text = "Character " + (characterID ) + "/" + charactersList.Length;												
				}else{
					characterInfoText.text = "Character " + (characterID + 1) + "/" + charactersList.Length;
				}					
				if(charactersList.Length<=1){
					characterInfoText.text = "Character " + (characterID + 1) + "/" + charactersList.Length;						
				}				
				if(char_name.Contains("Char_000")){
					Debug.LogWarning("character NAME: " + char_name);
					characterInfoText.text = "Character ZERO - Dummy with Global Actions Shared";
				}		
			}
		}
		public void PreviousCharacter(){
			getPreviousCharacterValues();
			if (characterID > 0){
				characterID--;
				HideCharacters();
				ShowAtualCharacter();
				stringArgs = "OnChangeCharacter";
				SendEvents();
			}
		}   
		public void NextCharacter(){
			getPreviousCharacterValues();
			if (characterID < charactersList.Length - 1){
				characterID++;
				HideCharacters();
				ShowAtualCharacter();
				stringArgs = "OnChangeCharacter";
				SendEvents();
			}
		}
		void SendEvents(){
			if (FunctionEventSendInfoWithArgs != null){
				FunctionEventSendInfoWithArgs(stringArgs);
			}
		}
		public void SendEventWithArgsByButton(){
			SendEvents();
		}
		void ShowHideButtonsNextPrevious(){
			if (charactersList.Length<=1){
				previousButton.gameObject.SetActive(false);
				nextButton.gameObject.SetActive(false);
				return;
			}  
			if (previousButton != null){
				if (characterID > 0){           
					previousButton.interactable = true;
				}else{
					previousButton.interactable = false;
				}
			}
			if (nextButton!=null){
				if (characterID < charactersList.Length - 1){
					nextButton.interactable = true;
				}else{
					nextButton.interactable = false;
				}
			}
		}  
		public void Jump(){
			playerControllDemo.Jump();
		}
		public void ActionNoLoopedReturnToIdle(bool value){
			playerControllDemo.ActionNoLoopedReturnToIdle(value);
		}
		public void SetActionInt(int _actionID = -1){
			playerControllDemo.SetActionInt(_actionID);
		}
		public void SetActionName(string _actionName = "011_idle_1"){
			playerControllDemo.SetActionName(_actionName);
		}
		public void ToogleRotateCharacter(bool value){
			autoRotation = value;
		}
		public void ToogleSmoothSpeedAnimation(bool value){
			smoothSpeedAnimation = value;
			if (smoothSpeedAnimation == true){
				SetAnimatorSpeed(0.2f);
			}else{
				SetAnimatorSpeed(1.0f);
			}
		}
		public void ToogleHideObjects(bool value){
			if (personalObjects3DList != null){
				if (personalObjects3DList.Length > 0){
					personalObjects3D = personalObjects3DList[characterID];				
					personalObjects3D.SetActive(value);
					showPersonalObjects = value;
				}
			}
		}
		public void ToogleHideGround(bool value){
			GameObject ground = GameObject.Find("Floor_Cube");
			if (ground != null){
				MeshRenderer meshRenderer = ground.GetComponent<MeshRenderer>();
				meshRenderer.enabled = value;
				showGround = value;
			}
		}
		public void RotateCharacter(float rotation = -1){
			 if (charactersList != null){
				if(charactersList.Length>0){
					GameObject character = charactersList[characterID];
					if (character.activeSelf == true){ 
						if (rotation != -1){
							rotationAtual = character.transform.rotation.y;
							rotationAtual += rotation;
							character.transform.RotateAround(transform.position, transform.up, rotationAtual);
						}else{
							character.transform.RotateAround(transform.position, transform.up, Time.deltaTime * -90f);
							rotationAtual = character.transform.rotation.y;
						}
					}				 
				 }			 
			 }
		}
		public void SetAnimatorSpeed(float _speed = 1){
			playerControllDemo.SetAnimatorSpeed(_speed);
		}
		public void HandObjectSwitchNext(){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectSwitchNext();
		}
		public void HandObjectSwitchHideAndShow(){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectSwitchHideAndShow();
		} 
		public void HandObjectShow(int handObjectID = -1){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectShow(handObjectID);
		}
		public void HandObjectShowAll(){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectShowAll();
		}			
		public void HandObjectHideAll(){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectHideAll();
		}
		public void HandObjectHideAllAndShowAtual(){
			if(handObjectSwitching==null){
				Debug.LogWarning("character/handObjectSwitching NOT FOUND!");
				return;
			}
			handObjectSwitching.HandObjectHideAllAndShowAtual();
		}
		public void CostumeSwitchNext(){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeSwitchNext();
		}
		public void CostumeSwitchHideAndShow(){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeSwitchHideAndShow();
		}    
		public void CostumeShow(int costumeID = -1){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeShow(costumeID);
		}
		public void CostumeShowAll(){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeShowAll();
		}		
		public void CostumeHideAll(){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeHideAll();
		}
		public void CostumeHideAllAndShowAtual(){
			if(costumeSwitching==null){
				Debug.LogWarning("character/costumeSwitching NOT FOUND!");
				return;
			}
			costumeSwitching.CostumeHideAllAndShowAtual();
		}
		public void CharacterSwitchHideAndShow(){
			if (character!=null){
				if (character.gameObject.activeSelf){
					character.gameObject.SetActive(false);
				}else{
					character.gameObject.SetActive(true);
				}
			}     
		}
		void GetKeyBoard(){
			if (Input.GetKeyDown(KeyCode.LeftArrow)){
				PreviousCharacter();
			}else if (Input.GetKeyDown(KeyCode.RightArrow)){
				NextCharacter();
			}
			if (Input.GetKeyDown(KeyCode.R)){
				ToogleRotateCharacter(!autoRotation);
				if (rotateToggle != null){
					rotateToggle.isOn = autoRotation;
				}
			}
			if (Input.GetKeyDown(KeyCode.S)){
				ToogleSmoothSpeedAnimation(!smoothSpeedAnimation);
				if (speedToggle != null){
					speedToggle.isOn = smoothSpeedAnimation;
				}
			}
			if (Input.GetKeyDown(KeyCode.O)){     
				ToogleHideObjects(!showPersonalObjects);     
				if (hideObjectsToggle != null){
					hideObjectsToggle.isOn = showPersonalObjects;
				}          
			}
			if (Input.GetKeyDown(KeyCode.G)){
				ToogleHideGround(!showGround);      
				if (hideGroundToggle != null){
					hideGroundToggle.isOn = showGround;               
				}
			}
			if (Input.GetKeyDown(KeyCode.H)){
				HandObjectSwitchNext();
			}
			if (Input.GetKeyDown(KeyCode.C)){
				CostumeSwitchHideAndShow();
			}
			if (Input.GetKeyDown(KeyCode.U)){
				CharacterSwitchHideAndShow();
			}
			if (Input.GetKeyDown(KeyCode.P)){
				if (Time.timeScale > 0f){
					Time.timeScale = 0f;
				}else{
					Time.timeScale = 1f;
				}
			}
			if (Input.GetKeyDown(KeyCode.M)){
				if (menu2D!=null){
					menu2D.active = !menu2D.activeSelf;
				}
			}
			if (Input.GetKeyDown(KeyCode.Alpha1) || Input.GetKeyDown(KeyCode.Keypad1)){
				SetActionName("161_victory_1");
			}
			if (Input.GetKeyDown(KeyCode.Alpha2) ||Input.GetKeyDown(KeyCode.Keypad2)){
				SetActionName("162_victory_2");
			}
			if (Input.GetKeyDown(KeyCode.Alpha3) || Input.GetKeyDown(KeyCode.Keypad3)){
				SetActionName("163_victory_3");
			}
			if (Input.GetKeyDown(KeyCode.Alpha4) || Input.GetKeyDown(KeyCode.Keypad4)){
				SetActionName("164_victory_4");
			}
		}
	}
	
}


