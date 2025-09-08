package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Estudiante;
import co.edu.udem.ejemplodockercompose.service.EstudianteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api")
public class EstudianteController {
    private final EstudianteService estudianteService;

    public EstudianteController(EstudianteService estudianteService) {
        this.estudianteService = estudianteService;
    }

    @GetMapping("/saludo")
    public String holaMundo(){
        return "Hola Mundo";
    }

    @GetMapping("/estudiantes")
    public List<Estudiante> getEstudiantes(){
        return estudianteService.findAll();
    }

    @PostMapping("/estudiantes")
    public Estudiante createEstudiante(@RequestBody Estudiante estudiante) {
        return estudianteService.create(estudiante);
    }
}
