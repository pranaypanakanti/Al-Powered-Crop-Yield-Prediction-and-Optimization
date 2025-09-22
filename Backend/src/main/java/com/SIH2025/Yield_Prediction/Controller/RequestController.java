package com.SIH2025.Yield_Prediction.Controller;

import com.SIH2025.Yield_Prediction.Service.ServiceProvider;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class RequestController {

    private ServiceProvider service;

    public RequestController(ServiceProvider service) {
        this.service = service;
    }

    @GetMapping("/crop/search")
    public List<String> getCropByKeyWord(String keyword){
        List<String> crops = service.getCropByKeyWord(keyword);
        return crops;
    }

    @GetMapping("/state/search")
    public List<String> getStateByKeyWord(String keyword){
        List<String> state = service.getStateCropByKeyWord(keyword);
        return state;
    }

    @PostMapping("/predict")
    public Map<String, Object> predict(@RequestParam String state,
                                       @RequestParam float acres,
                                       @RequestParam String crop) {
        float prediction = service.getPrediction(state, acres, crop);
        return Map.of("prediction", prediction);
    }

//    @GetMapping("/recommend")
//    public Map<String, Object> recommend(@RequestParam String state,
//                                         @RequestParam float acres) {
//        List<String> recs = service.getRecommendations(state, acres);
//        return Map.of("recommendations", recs);
//    }

}
