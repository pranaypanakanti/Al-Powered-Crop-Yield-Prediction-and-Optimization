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

    private final RestTemplate restTemplate;
    private final String FASTAPI_PREDICT_URL = "http://localhost:8000/predict";
    private final String FASTAPI_RECOMMEND_URL = "http://localhost:8000/recommend";

    public ServiceProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public Map<String, Object> getPrediction(String state, float area, String crop) {
        Map<String, Object> payload = Map.of(
                "state", state,
                "area", area,
                "crop", crop
        );

        Map<String, Object> response = restTemplate.postForObject(FASTAPI_PREDICT_URL, payload, Map.class);
        return response;
        }

    public List<Map<String, Object>> getRecommendations(String state, float area) {
        Map<String, Object> payload = Map.of(
                "state", state,
                "area", area
        );

        List<Map<String, Object>> response =
                restTemplate.postForObject(FASTAPI_RECOMMEND_URL, payload, List.class);

        return response != null ? response : List.of();
    }


}
