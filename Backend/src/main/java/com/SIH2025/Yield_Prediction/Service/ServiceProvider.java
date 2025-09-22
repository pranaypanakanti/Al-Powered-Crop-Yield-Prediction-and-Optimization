package com.SIH2025.Yield_Prediction.Service;

import com.SIH2025.Yield_Prediction.Repository.RepoManagerCrops;
import com.SIH2025.Yield_Prediction.Repository.RepoManagerStates;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ServiceProvider {

    @Autowired
    private RepoManagerCrops cropRepo;
    @Autowired
    private RepoManagerStates stateRepo;

    public List<String> getCropByKeyWord(String keyword) {
        return cropRepo.getCropByKeyWord(keyword);
    }

    public List<String> getStateCropByKeyWord(String keyword) {
        return stateRepo.getStateByKeyWord(keyword);
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://localhost:8000/predict";

    public float getPrediction(String state, float area, String crop) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("crop", crop);
        payload.put("area", area);
        payload.put("state", state);
        Map<String, Object> response = restTemplate.postForObject(FASTAPI_URL, payload, Map.class);
        if (response != null && response.containsKey("predicted_yield")) {
            return ((Number) response.get("predicted_yield")).floatValue();
        }
        return 0;

    }

//    private final String FASTAPI_RECOMMEND_URL = "http://localhost:8000/recommend";
//
//    public List<String> getRecommendations(String state, float area) {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("State", state);
//        payload.put("Area", area);
//
//        Map response = restTemplate.postForObject(FASTAPI_RECOMMEND_URL, payload, Map.class);
//
//        if (response != null && response.containsKey("recommendations")) {
//            return (List<String>) response.get("recommendations");
//        }
//        return Collections.emptyList();
//    }

}
