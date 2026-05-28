package com.example.cakesmenagement.Repositories;

import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Entities.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriesRepo extends JpaRepository<Categories, Integer> {
      Categories findByName(String name);
}
