package com.crud.demo.repository;

import com.crud.demo.model.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;

//@Repository

public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    
}
