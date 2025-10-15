package co.edu.udem.ejemplodockercompose.repository;

import co.edu.udem.ejemplodockercompose.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
}


