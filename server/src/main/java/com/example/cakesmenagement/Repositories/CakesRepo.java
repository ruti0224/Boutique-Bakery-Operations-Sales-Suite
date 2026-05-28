package com.example.cakesmenagement.Repositories;

import com.example.cakesmenagement.Entities.Cakes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CakesRepo extends JpaRepository<Cakes, Integer> {
   List<Cakes> findByName(String name);
   List<Cakes> findByCategory_CategoryCode(int categoryCode);
}
