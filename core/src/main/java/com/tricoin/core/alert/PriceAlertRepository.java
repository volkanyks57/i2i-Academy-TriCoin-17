// 2. PriceAlertRepository.java (Repository)
package com.tricoin.core.alert;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {

    List<PriceAlert> findByUsernameAndIsTriggeredTrue(String username);
    List<PriceAlert> findByIsTriggeredFalse();
}
