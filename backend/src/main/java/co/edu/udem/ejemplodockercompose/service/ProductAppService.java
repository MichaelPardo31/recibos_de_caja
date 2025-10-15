package co.edu.udem.ejemplodockercompose.service;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductAppService {
    private final ProductRepository productRepository;

    public ProductAppService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<Product> search(String q) { return productRepository.findByNameContainingIgnoreCase(q); }

    public Product save(Product p) { return productRepository.save(p); }

    public void decrementStockOrThrow(Long productId, int quantity) {
        Product p = productRepository.findById(productId).orElseThrow();
        if (p.getStock() < quantity) throw new IllegalArgumentException("Stock insuficiente");
        p.setStock(p.getStock() - quantity);
        productRepository.save(p);
    }
}


