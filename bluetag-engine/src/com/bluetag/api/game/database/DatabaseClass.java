package com.bluetag.api.game.database;

import java.util.ArrayList;
import java.util.HashMap;

import com.bluetag.model.LocationModel;

public class DatabaseClass {
	private static HashMap<String, ArrayList<LocationModel>> taggableDB = new HashMap<String, ArrayList<LocationModel>>();
	private static HashMap<String, ArrayList<String>> distancesDB = new HashMap<String, ArrayList<String>>();

	public static synchronized void setTaggableDB(HashMap<String, ArrayList<LocationModel>> addDB) {
		taggableDB.clear(); 
		for(String user: addDB.keySet()){
			taggableDB.put(user, addDB.get(user));
		}
	}
	
	public static synchronized void setDistancesDB(HashMap<String, ArrayList<String>> addDB) {
		distancesDB.clear(); 
		for(String user: addDB.keySet()){
			distancesDB.put(user, addDB.get(user));
		}
	}
	
	public static synchronized ArrayList<LocationModel> getTaggableList(String username){
		return taggableDB.get(username);
	}
	
	public static synchronized ArrayList<String> getDistancesList(String username){
		return distancesDB.get(username);
	}
}
