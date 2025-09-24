package com.SIH2025.Yield_Prediction.Repository;

import com.SIH2025.Yield_Prediction.Model.CropNames;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepoManagerCrops extends JpaRepository<CropNames,String>{
    @Query("select c.cropName from CropNames c where "+
            "lower(c.cropName) like lower(concat('%',:keyword,'%'))")
    List<String> getCropByKeyWord(String keyword);
}
