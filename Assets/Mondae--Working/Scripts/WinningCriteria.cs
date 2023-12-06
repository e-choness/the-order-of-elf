using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Assertions;

public enum Ending
{
   Promotion,
   Recognition,
   Demotion
}

public class WinningCriteria : SingletonPersistent<WinningCriteria>
{
   public List<Gift> Gifts = new()
   {
      // Nice gift list
      new Gift() { Name = "Chocolate", List = GiftList.Nice },
      new Gift() { Name = "GiftCard", List = GiftList.Nice },
      new Gift() { Name = "Alan Wake 2", List = GiftList.Nice }, // Yes, I would like a copy of it XD
      
      // Naughty gift list, I'm just making this list up...
      new Gift() { Name = "EMO Chicken", List = GiftList.Naughty },
      new Gift() { Name = "Dirty Gnome", List = GiftList.Naughty },
      new Gift() { Name = "Sticky Sockets", List = GiftList.Naughty }
   };

   public Gift IdealGift { get; set; }
   private const string IdealGiftKey = "IdealGift";
   private const string IdealListKey = "IdealList";
   
   public Gift ChosenGift { get; set; }
   private const string ChosenGiftKey = "ChosenGift";
   private const string ChosenListKey = "ChosenList";

   private void Start()
   {
      EndingDemotionTests();
      EndingPromotionTests();
      EndingRecognitionTests();
   }

   public Ending DecideEnding()
   {
      LoadChoice();
      if (ChosenGift == null)
      {
         Debug.LogError("Chosen gift has not values in PlayerPrefs. Make sure to call SaveChoice function.");
         return Ending.Demotion;
      }
      
      LoadCIdeal();
      if (IdealGift == null)
      {
         Debug.LogError("Ideal gift has no values in PlayerPrefs. Make sure to call SaveIdeal function.");
         return Ending.Demotion;
      }
      
      if(IdealGift.Name.Equals(ChosenGift.Name))
      {
         if (IdealGift.List == ChosenGift.List)
         {
            return Ending.Promotion;
         }
         else
         {
            return Ending.Recognition;
         }
      }
      return Ending.Demotion;
   }

   #region Save and Load Data

   public void SaveIdeal()
   {
      if (IdealGift == null)
      {
         Debug.LogError("Ideal gift has no values.");
         return;
      }
      
      PlayerPrefs.SetString(IdealGiftKey, IdealGift.Name);
      PlayerPrefs.SetInt(IdealListKey, (int)IdealGift.List);
   }
   
   public void LoadCIdeal()
   {
      if (!PlayerPrefs.HasKey(IdealGiftKey))
      {
         Debug.LogError("Ideal gift is not saved in PlayerPrefs.");
         return;
      }
      if (!PlayerPrefs.HasKey(IdealListKey))
      {
         Debug.LogError("Ideal list is not saved in PlayerPrefs.");
         return;
      }
      
      var giftName = PlayerPrefs.GetString(IdealGiftKey);
      var giftList = (GiftList)PlayerPrefs.GetInt(IdealListKey);
      IdealGift = new Gift() { Name = giftName, List = giftList };
   }

   public void SaveChoice()
   {
      if (ChosenGift == null)
      {
         Debug.LogError("Chosen gift has no values.");
         return;
      }
      
      PlayerPrefs.SetString(ChosenGiftKey, ChosenGift.Name);
      PlayerPrefs.SetInt(ChosenListKey, (int)ChosenGift.List);
   }

   public void LoadChoice()
   {
      if (!PlayerPrefs.HasKey(ChosenGiftKey))
      {
         Debug.LogError("Chosen gift is not saved in PlayerPrefs.");
         return;
      }
      if (!PlayerPrefs.HasKey(ChosenListKey))
      {
         Debug.LogError("Chosen list is not saved in PlayerPrefs.");
         return;
      }
      
      var giftName = PlayerPrefs.GetString(ChosenGiftKey);
      var giftList = (GiftList)PlayerPrefs.GetInt(ChosenListKey);
      ChosenGift = new Gift() { Name = giftName, List = giftList };
   }

   #endregion

   #region Tests

   private void EndingDemotionTests()
   {
      ChosenGift = new Gift() { Name = "Chocolate", List = GiftList.Naughty };
      SaveChoice();
      IdealGift = new Gift() { Name = "Alan Wake 2", List = GiftList.Nice };
      SaveIdeal();

      var ending = DecideEnding();
      Assert.IsTrue(ending == Ending.Demotion);
      Debug.LogFormat("{0} passed.", nameof(EndingDemotionTests));
   }

   private void EndingPromotionTests()
   {
      ChosenGift = new Gift() { Name = "EMO Chicken", List = GiftList.Naughty };
      SaveChoice();
      IdealGift = new Gift() { Name = "EMO Chicken", List = GiftList.Naughty };
      SaveIdeal();

      var ending = DecideEnding();
      Assert.IsTrue(ending == Ending.Promotion);
      Debug.LogFormat("{0} passed.", nameof(EndingPromotionTests));
   }

   private void EndingRecognitionTests()
   {
      ChosenGift = new Gift() { Name = "EMO Chicken", List = GiftList.Nice };
      SaveChoice();
      IdealGift = new Gift() { Name = "EMO Chicken", List = GiftList.Naughty };
      SaveIdeal();

      var ending = DecideEnding();
      Assert.IsTrue(ending == Ending.Recognition);
      Debug.LogFormat("{0} passed.", nameof(EndingRecognitionTests));
   }

   #endregion
   
}
