package com.bluetag.api.register.resources;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.bluetag.api.register.service.RegisterService;
import com.bluetag.model.UserModel;
import com.google.gson.Gson;

@Path("/register")
public class RegisterResource {
	Gson gson = new Gson();
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public String register(String userInfo){
		RegisterService registerService = new RegisterService();
		UserModel userToRegister = gson.fromJson(userInfo, UserModel.class);
		if (userToRegister.get_id().contains(" ") || userToRegister.getName().contains(" ")){
			return "{\"result\": \"name and id should not have spaces\"}";
		} else {
		return registerService.registerUser(userInfo);
		}
	}
	
	@GET
	@Path("/clearLocs")
	@Produces(MediaType.APPLICATION_JSON)
	public String clearLocations() {
		RegisterService regserv = new RegisterService();
		regserv.clearLocations();
		
		return "{\"result\": \"reset all locations to 0,0\"}";
	}
}
