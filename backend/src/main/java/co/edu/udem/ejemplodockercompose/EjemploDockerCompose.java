package co.edu.udem.ejemplodockercompose;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.repository.ProductRepository;

import java.math.BigDecimal;

@SpringBootApplication
public class EjemploDockerCompose {

    private final ProductRepository productRepository;

    public EjemploDockerCompose(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(EjemploDockerCompose.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedProducts() {
        if (productRepository.count() > 0) return;
        productRepository.save(make("Mouse Óptico", 15.90, 30));
        productRepository.save(make("Teclado Mecánico", 49.90, 20));
        productRepository.save(make("Monitor 24\"", 129.00, 10));
        productRepository.save(make("USB 64GB", 12.50, 100));
    }

    private Product make(String name, double price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setUnitPrice(BigDecimal.valueOf(price));
        p.setStock(stock);
        return p;
    }
}
