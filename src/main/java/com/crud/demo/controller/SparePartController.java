package com.crud.demo.controller;

import com.crud.demo.model.SparePart;
import com.crud.demo.repository.SparePartRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;


@RestController 
@RequestMapping("/api/sparePart")

public class SparePartController {
    private final SparePartRepository sparePartRepository;

    public SparePartController(SparePartRepository sparePartRepository) {
        this.sparePartRepository = sparePartRepository;
    }

    // Esto es un endpoint
    // endpoint para almacenar un nuevo repuesto CREATE (post:
    // http://localhost:8080/api/sparePart/{id})
    @PostMapping
    public SparePart saveSparePart(@RequestBody SparePart sparePart) {
        return sparePartRepository.save(sparePart);
    }

    // READ todos
    @GetMapping
    public List<SparePart> getAllSpareParts() {
        return sparePartRepository.findAll();
    }

    // UPDATE
    @PutMapping("/{id}")
    public SparePart updateSparePart(
            @PathVariable Long id,
            @RequestBody SparePart sparePart) {

        sparePart.setId(id);
        return sparePartRepository.save(sparePart);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteSparePart(@PathVariable Long id) {
        sparePartRepository.deleteById(id);
    }
}