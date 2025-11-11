package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.service.ProductAppService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductAppService productAppService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Mouse Óptico");
        testProduct.setUnitPrice(BigDecimal.valueOf(25000));
        testProduct.setStock(30);
    }

    @Test
    void testFindAll_WithoutQuery() throws Exception {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productAppService.findAll()).thenReturn(products);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Mouse Óptico"))
                .andExpect(jsonPath("$[0].unitPrice").value(25000))
                .andExpect(jsonPath("$[0].stock").value(30));

        verify(productAppService, times(1)).findAll();
        verify(productAppService, never()).search(anyString());
    }

    @Test
    void testFindAll_WithQuery() throws Exception {
        // Given
        String query = "mouse";
        List<Product> products = Arrays.asList(testProduct);
        when(productAppService.search(query)).thenReturn(products);

        // When & Then
        mockMvc.perform(get("/api/products")
                        .param("q", query))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Mouse Óptico"));

        verify(productAppService, never()).findAll();
        verify(productAppService, times(1)).search(query);
    }

    @Test
    void testFindAll_WithEmptyQuery() throws Exception {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productAppService.findAll()).thenReturn(products);

        // When & Then
        mockMvc.perform(get("/api/products")
                        .param("q", ""))
                .andExpect(status().isOk());

        verify(productAppService, times(1)).findAll();
        verify(productAppService, never()).search(anyString());
    }

    @Test
    void testSave() throws Exception {
        // Given
        Product newProduct = new Product();
        newProduct.setName("Nuevo Producto");
        newProduct.setUnitPrice(BigDecimal.valueOf(50000));
        newProduct.setStock(10);

        when(productAppService.save(any(Product.class))).thenReturn(testProduct);

        // When & Then
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Mouse Óptico"));

        verify(productAppService, times(1)).save(any(Product.class));
    }

    @Test
    void testSave_InvalidProduct() throws Exception {
        // Given
        Product invalidProduct = new Product(); // Sin campos requeridos

        // When & Then
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProduct)))
                .andExpect(status().isOk()); // El controller no valida, solo delega al service

        verify(productAppService, times(1)).save(any(Product.class));
    }
}

