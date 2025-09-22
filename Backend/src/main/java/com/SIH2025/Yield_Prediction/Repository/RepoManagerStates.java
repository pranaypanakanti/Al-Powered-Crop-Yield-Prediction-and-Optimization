package com.SIH2025.Yield_Prediction.Repository;

import com.SIH2025.Yield_Prediction.Model.CropNames;
import com.SIH2025.Yield_Prediction.Model.StateNames;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepoManagerStates extends JpaRepository<StateNames,String> {
    @Query("select s.stateName from StateNames s where "+
            "lower(s.stateName) like lower(concat('%',:keyword,'%'))")
    List<String> getStateByKeyWord(String keyword);
}
