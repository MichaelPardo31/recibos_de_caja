package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Ticket;
import co.edu.udem.ejemplodockercompose.service.TicketAppService;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketAppService ticketAppService;

    @Autowired
    private ObjectMapper objectMapper;

    private Ticket testTicket;

    @BeforeEach
    void setUp() {
        testTicket = new Ticket();
        testTicket.setId(1L);
        testTicket.setTotal(BigDecimal.valueOf(50000));
    }

    @Test
    void testFindAll() throws Exception {
        // Given
        List<Ticket> tickets = Arrays.asList(testTicket);
        when(ticketAppService.findAll()).thenReturn(tickets);

        // When & Then
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].total").value(50000));

        verify(ticketAppService, times(1)).findAll();
    }

    @Test
    void testCreate() throws Exception {
        // Given
        TicketController.CreateTicketRequest request = new TicketController.CreateTicketRequest(
                Arrays.asList(
                        new TicketController.Item(1L, 2, BigDecimal.valueOf(25000))
                )
        );

        when(ticketAppService.create(any())).thenReturn(testTicket);

        // When & Then
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.total").value(50000));

        verify(ticketAppService, times(1)).create(any());
    }

    @Test
    void testCreate_MultipleItems() throws Exception {
        // Given
        TicketController.CreateTicketRequest request = new TicketController.CreateTicketRequest(
                Arrays.asList(
                        new TicketController.Item(1L, 2, BigDecimal.valueOf(25000)),
                        new TicketController.Item(2L, 1, BigDecimal.valueOf(85000))
                )
        );

        when(ticketAppService.create(any())).thenReturn(testTicket);

        // When & Then
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(ticketAppService, times(1)).create(any());
    }

    @Test
    void testCreate_EmptyItems() throws Exception {
        // Given
        TicketController.CreateTicketRequest request = new TicketController.CreateTicketRequest(
                Arrays.asList()
        );

        // When & Then
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError()); // El service lanza excepción

        verify(ticketAppService, times(1)).create(any());
    }
}

