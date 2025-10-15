package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.service.ProductAppService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/products")
public class ProductController {
    private final ProductAppService products;

    public ProductController(ProductAppService products) { this.products = products; }

    @GetMapping
    public List<Product> findAll(@RequestParam(value = "q", required = false) String q) {
        if (q != null && !q.isBlank()) return products.search(q);
        return products.findAll();
    }

    @PostMapping
    public Product save(@RequestBody Product p) { return products.save(p); }
}


