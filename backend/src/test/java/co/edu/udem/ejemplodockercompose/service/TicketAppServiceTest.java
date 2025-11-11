package co.edu.udem.ejemplodockercompose.service;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.model.Ticket;
import co.edu.udem.ejemplodockercompose.repository.ProductRepository;
import co.edu.udem.ejemplodockercompose.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketAppServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductAppService productAppService;

    @InjectMocks
    private TicketAppService ticketAppService;

    private Product testProduct;
    private TicketAppService.ItemInput itemInput;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Mouse Óptico");
        testProduct.setUnitPrice(BigDecimal.valueOf(25000));
        testProduct.setStock(30);

        itemInput = new TicketAppService.ItemInput(1L, 2, BigDecimal.valueOf(25000));
    }

    @Test
    void testFindAll() {
        // Given
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        List<Ticket> tickets = Arrays.asList(ticket);
        when(ticketRepository.findAll()).thenReturn(tickets);

        // When
        List<Ticket> result = ticketAppService.findAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(ticketRepository, times(1)).findAll();
    }

    @Test
    void testCreate_Success() {
        // Given
        List<TicketAppService.ItemInput> items = Arrays.asList(itemInput);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });
        doNothing().when(productAppService).decrementStockOrThrow(anyLong(), anyInt());

        // When
        Ticket result = ticketAppService.create(items);

        // Then
        assertNotNull(result);
        assertNotNull(result.getItems());
        assertEquals(1, result.getItems().size());
        assertEquals(BigDecimal.valueOf(50000), result.getTotal());
        verify(productRepository, times(1)).findById(1L);
        verify(productAppService, times(1)).decrementStockOrThrow(1L, 2);
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void testCreate_EmptyItems() {
        // Given
        List<TicketAppService.ItemInput> items = Collections.emptyList();

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ticketAppService.create(items)
        );
        assertEquals("Sin items", exception.getMessage());
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testCreate_NullItems() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ticketAppService.create(null)
        );
        assertEquals("Sin items", exception.getMessage());
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testCreate_ProductNotFound() {
        // Given
        List<TicketAppService.ItemInput> items = Arrays.asList(itemInput);
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(Exception.class, () -> ticketAppService.create(items));
        verify(productRepository, times(1)).findById(1L);
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testCreate_InsufficientStock() {
        // Given
        TicketAppService.ItemInput itemWithHighQuantity = 
            new TicketAppService.ItemInput(1L, 50, BigDecimal.valueOf(25000));
        List<TicketAppService.ItemInput> items = Arrays.asList(itemWithHighQuantity);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ticketAppService.create(items)
        );
        assertEquals("Stock insuficiente", exception.getMessage());
        verify(productRepository, times(1)).findById(1L);
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testCreate_MultipleItems() {
        // Given
        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Teclado");
        product2.setUnitPrice(BigDecimal.valueOf(85000));
        product2.setStock(20);

        TicketAppService.ItemInput item1 = new TicketAppService.ItemInput(1L, 2, BigDecimal.valueOf(25000));
        TicketAppService.ItemInput item2 = new TicketAppService.ItemInput(2L, 1, BigDecimal.valueOf(85000));
        List<TicketAppService.ItemInput> items = Arrays.asList(item1, item2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });
        doNothing().when(productAppService).decrementStockOrThrow(anyLong(), anyInt());

        // When
        Ticket result = ticketAppService.create(items);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getItems().size());
        assertEquals(BigDecimal.valueOf(135000), result.getTotal());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).findById(2L);
        verify(productAppService, times(1)).decrementStockOrThrow(1L, 2);
        verify(productAppService, times(1)).decrementStockOrThrow(2L, 1);
    }
}

