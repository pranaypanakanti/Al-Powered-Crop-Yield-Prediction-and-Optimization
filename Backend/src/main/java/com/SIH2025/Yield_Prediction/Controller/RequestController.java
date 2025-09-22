package com.SIH2025.Yield_Prediction.Controller;

import com.SIH2025.Yield_Prediction.Service.ServiceProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class RequestController {

    private ServiceProvider service;

    public RequestController(ServiceProvider service) {
        this.service = service;
    }



}
