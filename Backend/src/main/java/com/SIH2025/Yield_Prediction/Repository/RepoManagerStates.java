package com.SIH2025.Yield_Prediction.Repository;

import com.SIH2025.Yield_Prediction.Model.StateNames;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoManagerStates extends JpaRepository<StateNames,String> {

}
