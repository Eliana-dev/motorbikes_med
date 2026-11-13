package com.crud.demo.controller;

import com.crud.demo.model.SparePart;
import com.crud.demo.repository.SparePartRepository;
import java.util.List;
import java.util.Optional;
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
    @GetMapping("path")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }

    // endpoint para almacenar un nuevo repuesto CREATE (post:
    // http://localhost:8080/api/sparePart/{id})
    @PostMapping("path")
    public SparePart saveSparePart(@RequestBody SparePart sparePart) {
        return sparePartRepository.save(sparePart);
    }

    // READ todos
    @GetMapping
    public List<SparePart> getAllSpareParts() {
        return sparePartRepository.findAll();
    }

    // READ obtener por id
    @GetMapping("/{id}")
    public Optional<SparePart> getSparePartById(@PathVariable Long id) {
        return sparePartRepository.findById(id);
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