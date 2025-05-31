@Patch(':id/estado')
async actualizarEstado(
  @Param('id') id: number,
  @Body() data: { estado: EstadoLaboral; motivo?: string }
): Promise<ApiResponse<FichaEmpresa>> {
  try {
    const ficha = await this.fichaEmpresaService.findOne(id);
    if (!ficha) {
      throw new NotFoundException('Ficha de empresa no encontrada');
    }

    if (data.estado === EstadoLaboral.DESVINCULADO && !data.motivo) {
      throw new BadRequestException('El motivo de desvinculación es requerido');
    }

    ficha.estado = data.estado;
    
    if (data.estado === EstadoLaboral.DESVINCULADO) {
      ficha.fechaFinContrato = new Date();
      ficha.motivoDesvinculacion = data.motivo;
    }

    const fichaActualizada = await this.fichaEmpresaService.update(id, ficha);

    return {
      success: true,
      message: 'Estado laboral actualizado exitosamente',
      data: fichaActualizada
    };
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Error al actualizar el estado laboral');
  }
} 