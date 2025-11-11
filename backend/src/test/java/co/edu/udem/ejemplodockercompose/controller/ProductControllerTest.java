package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.service.ProductAppService;
import co.edu.udem.ejemplodockercompose.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductAppService productAppService;

    @MockBean
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Evitar que el ApplicationReadyEvent de la app intente sembrar datos usando el repositorio real
        when(productRepository.count()).thenReturn(1L);

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Mouse Óptico");
        testProduct.setUnitPrice(BigDecimal.valueOf(25000));
        testProduct.setStock(30);
    }

    @Test
    void testFindAll() throws Exception {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productAppService.findAll()).thenReturn(products);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Mouse Óptico"));

        verify(productAppService, times(1)).findAll();
    }
}
