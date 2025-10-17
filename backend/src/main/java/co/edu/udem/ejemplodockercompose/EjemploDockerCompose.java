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
        productRepository.save(make("Mouse Óptico", 25000, 30));
        productRepository.save(make("Teclado Mecánico", 85000, 20));
        productRepository.save(make("Monitor 24\"", 450000, 10));
        productRepository.save(make("USB 64GB", 35000, 100));
        productRepository.save(make("Auriculares Bluetooth", 120000, 15));
        productRepository.save(make("Cargador USB-C", 18000, 50));
        productRepository.save(make("Mousepad Gaming", 15000, 25));
        productRepository.save(make("Webcam HD", 95000, 12));
    }

    private Product make(String name, double price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setUnitPrice(BigDecimal.valueOf(price));
        p.setStock(stock);
        return p;
    }
}
